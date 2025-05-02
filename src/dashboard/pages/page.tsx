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
  Input,
  FormField,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
import React, { useEffect, useState } from 'react';
import {
  getAllProducts,
  filterOutDiscounted,
  getHighestPricedNonDiscounted,
  applyDiscountForProduct,
} from '../../dashboard/utilities';



export default function Index() {
  const [candidates, setCandidates] = useState<products.Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Discount mode: PERCENT or AMOUNT
  const [discountMode, setDiscountMode] = useState<products.DiscountType.PERCENT
    | products.DiscountType.AMOUNT>(products.DiscountType.PERCENT);
  // The numeric value entered by user
  const [discountValue, setDiscountValue] = useState<string>('');

  useEffect(() => {
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
    initialSet();
  }, [error]);

  // default selectedId to first candidate
  useEffect(() => {
    if (candidates.length > 0) {
      setSelectedId(candidates[0]._id ?? '');
    }
  }, [candidates]);

  if (loading) {
    return (
      <Box align="center" verticalAlign="middle">
        <Loader text="Loading..." />
      </Box>
    );
  }

  if (error) {
    return <Text type="error">{error.message}</Text>;
  }

  // TBD - should not reach this situation. The button in the dashboard plugin should be disabled in this case.
  if (!candidates.length) {
    return <Text>No eligible products found.</Text>;
  }

  const dropdownOptions = candidates.map((p) => ({
    id: p._id ?? '',
    value: p.name ?? '',
  }));

  const selectedProduct = candidates.find((p) => p._id === selectedId);
  const maxAmount = selectedProduct?.priceData?.price ?? 0;
  function isValidDiscount(mode: products.DiscountType, value: number, maxAmount: number) {
    return (
      discountValue
      && value > 0
      && ((mode === products.DiscountType.PERCENT && value <= 100)
        || (mode === products.DiscountType.AMOUNT && value <= maxAmount))
    )
  }

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header
          title="Smart Dip"
          subtitle="Give people a break on your most expensive product."
        />
        <Page.Content>
          {/* product selection dropdown */}
          <Box marginBottom="12px">
            <Dropdown
              selectedId={selectedId}
              onSelect={({ id }) => setSelectedId(String(id))}
              options={dropdownOptions}
            />
          </Box>
          {/* the card showing the selected product */}
          <Box gap="5px" direction="vertical">
            <Card>
              <Card.Header
                title={
                  <Heading size="medium" as="h2">
                    Most expensive product
                    <Heading size="tiny" as="h3">
                      This is the most expensive product that is not already discounted.
                    </Heading>
                  </Heading>
                }
              />
              <Card.Divider />
              <Card.Content>
                <Box gap="12px" direction="horizontal" align="left">
                  <Image
                    src={selectedProduct?.media?.mainMedia?.image?.url}
                    width="15%"
                    height="15%"
                  />
                  <Box gap="4px" direction="vertical">
                    <Heading size="small" as="h3">
                      Product:
                    </Heading>
                    <Text>{selectedProduct?.name}</Text>
                    <Text>Full price: {selectedProduct?.priceData?.formatted?.price}</Text>
                  </Box>
                </Box>
              </Card.Content>
            </Card>
          </Box>

          {/* new controls: icon selector, input, and apply button */}
          <Box gap="16px" direction="horizontal" align="center" marginTop="16px">
            {/* 1) two icons: pick exactly one */}
            <Box gap="8px" direction="vertical">
              <Icons.Discount
                size={30}
                onClick={() => setDiscountMode(products.DiscountType.PERCENT)}
                style={{ cursor: 'pointer', color: discountMode === products.DiscountType.PERCENT ? '#3899EC' : undefined }}
              />
              <Icons.Payment
                size={30}
                onClick={() => setDiscountMode(products.DiscountType.AMOUNT)}
                style={{ cursor: 'pointer', color: discountMode === products.DiscountType.AMOUNT ? '#3899EC' : undefined }}
              />
            </Box>

            {/* 2) input for the numeric discount value */}
            <FormField label={discountMode === products.DiscountType.PERCENT ? 'Discount %' : 'Discount Amount'}>
              <Input
                type="number"
                min={1}
                max={discountMode === products.DiscountType.PERCENT ? 100 : maxAmount}
                status={(discountValue && !isValidDiscount(discountMode, Number(discountValue), maxAmount)) ? "error" : undefined}
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                size="small"
              />
            </FormField>
            <Button
              priority="primary"
              disabled={!isValidDiscount(discountMode, Number(discountValue), maxAmount)}
              onClick={async () => {
                await applyDiscountForProduct(selectedId, discountMode, Number(discountValue));
                // setSelectedId(''); // TBD - do it only after getting a success reply for discount

                //setLoading(true);
                // Navigate to Products list:
                dashboard.navigate({ pageId: "0845ada2-467f-4cab-ba40-2f07c812343d" }, { displayMode: "main" });
              }}
            >
              Apply Discount
            </Button>
          </Box>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
}