import { products } from '@wix/stores';
import { dashboard } from '@wix/dashboard'
import {
  Button,
  Card,
  Heading,
  Text,
  Page,
  WixDesignSystemProvider,
  Box,
  Loader,
  Image,
  Dropdown,
  NumberInput,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
import React, { useEffect, useState } from 'react';
import {
  getAllProducts,
  filterOutDiscounted,
  getHighestPricedNonDiscounted,
  applyDiscountForProduct,
} from '../utilities';

export default function Index() {
  const [candidates, setCandidates] = useState<products.Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Discount mode: PERCENT or AMOUNT
  const [discountMode, setDiscountMode] = useState<products.DiscountType.PERCENT
    | products.DiscountType.AMOUNT>(products.DiscountType.PERCENT);
  // The numeric value entered by user
  const [discountValue, setDiscountValue] = useState<number>(0);

  async function initialSet() {
    try {
      const allProducts = await getAllProducts();
      const nonDiscountedProducts = await filterOutDiscounted(allProducts);
      const candidates = getHighestPricedNonDiscounted(nonDiscountedProducts);
      setCandidates(candidates);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initialSet();
  }, []);

  // Handling visual representation when change of products was done without the app
  // Change of tabs handles it
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        initialSet();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // default selectedId to first candidate
  useEffect(() => {
    if (candidates.length > 0) {
      setSelectedId(candidates[0]._id ?? '');
    }
  }, [candidates]);

  const dropdownOptions = candidates.map((p) => ({
    id: p._id ?? '',
    value: p.name ?? '',
  }));

  const selectedProduct = candidates.find((p) => p._id === selectedId);
  const maxAmount = selectedProduct?.priceData?.price ?? 0;

  function isValidDiscount() {
    return (
      discountValue > 0
      && ((discountMode === products.DiscountType.PERCENT && discountValue <= 100)
        || (discountMode === products.DiscountType.AMOUNT && discountValue <= maxAmount))
    )
  }

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header
          title="SmartDip"
          subtitle="Give your customers an appreciated discount."
        />
        <Page.Content>
          <Box gap="12px" direction="vertical" align="left">
            <Card>
              <Card.Header
                title={
                  <>
                    <Heading size="medium" as="h2">
                      Most expensive non-discounted product{candidates.length > 1 ? 's' : ''}
                    </Heading>
                    <Heading size="tiny" as="h3">
                      {candidates.length > 1
                        ? `${candidates.length}` + " products share the highest price among the non-discounted products."
                        : "This is the most expensive non-discounted product."}
                    </Heading>
                  </>
                }
              />
              <Card.Divider />
              <Card.Content>
                {loading ? (
                  <Box align="center" verticalAlign="middle">
                    <Loader text="Loading..." />
                  </Box>
                ) : error ? (
                  <Box align="center" verticalAlign="middle">
                    <Text type="error">{error.message}</Text>
                  </Box>
                ) : !candidates.length ? (
                  <Box gap="12px" align="center" direction="vertical" verticalAlign="middle">
                    <Text>Oops! No eligible products found.</Text>
                    <Button
                      priority="primary"
                      onClick={() => {
                        dashboard.navigate({ pageId: "0845ada2-467f-4cab-ba40-2f07c812343d" }, { displayMode: "main" })
                      }}
                    >
                      Get back to Products page
                    </Button>
                  </Box>
                ) : (
                  <Box gap="12px" direction="vertical" align="left">
                    {candidates.length > 1 && (
                      <>
                        <Text weight="thin">Select one of these products to discount:</Text>
                        <Dropdown
                          selectedId={selectedId}
                          onSelect={({ id }) => setSelectedId(String(id))}
                          options={dropdownOptions}
                        />
                      </>
                    )}
                    <Box gap="36px" direction="horizontal" align="left">
                      <Image
                        src={selectedProduct?.media?.mainMedia?.image?.url}
                        width="20%"
                        height="auto"
                      />
                      <Box gap="8px" direction="vertical" align="left">
                        <Box gap="4px">
                          <Text weight="bold">Product:</Text>
                          <Text>{selectedProduct?.name}</Text>
                        </Box>
                        <Box gap="4px">
                          <Text weight="bold">Full price:</Text>
                          <Text>{selectedProduct?.priceData?.formatted?.price}</Text>
                        </Box>
                        <Box gap="16px" direction="vertical" align="left" marginTop="8px">
                          <Box gap="4px" direction="horizontal">
                            <Icons.Discount
                              size={24}
                              onClick={() => setDiscountMode(products.DiscountType.PERCENT)}
                              style={{ cursor: 'pointer', color: discountMode === products.DiscountType.PERCENT ? '#3899EC' : undefined }}
                            />
                            <Icons.Payment
                              size={24}
                              onClick={() => setDiscountMode(products.DiscountType.AMOUNT)}
                              style={{ cursor: 'pointer', color: discountMode === products.DiscountType.AMOUNT ? '#3899EC' : undefined }}
                            />
                            <NumberInput
                              suffix={discountMode === products.DiscountType.PERCENT ? '%' : selectedProduct?.priceData?.currency}
                              type="number"
                              min={0}
                              max={discountMode === products.DiscountType.PERCENT ? 100 : maxAmount}
                              status={(discountValue && !isValidDiscount()) ? "error" : undefined}
                              value={discountValue}
                              onChange={e => setDiscountValue(e ?? 0)}
                              size="small"
                            >
                            </NumberInput>
                          </Box>
                          <Button
                            priority="primary"
                            disabled={!isValidDiscount()}
                            onClick={async () => {
                              await applyDiscountForProduct(selectedId, discountMode, discountValue);
                              dashboard.navigate({ pageId: "0845ada2-467f-4cab-ba40-2f07c812343d" }, { displayMode: "main" });
                            }}
                          >
                            Apply Discount
                          </Button>
                          <Button
                            skin="standard"
                            priority="secondary"
                            onClick={() => {
                              dashboard.navigate({ pageId: "0845ada2-467f-4cab-ba40-2f07c812343d" }, { displayMode: "main" })
                            }}
                          >
                            Regretting? Back to Products page
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Card.Content>
            </Card>
          </Box>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
}