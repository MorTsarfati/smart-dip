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
  useEffect(() => {
    console.log("Test5");
  }, []);
  //const [allProducts, setAllProducts] = useState<products.Product[]>([]);
  //const [nonDiscountedProducts, setNonDiscountedProducts] = useState<products.Product[]>([]);
  const [candidates, setCandidates] = useState<products.Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) discount mode: PERCENT or AMOUNT
  const [discountMode, setDiscountMode] = useState<products.DiscountType.PERCENT
    | products.DiscountType.AMOUNT>(products.DiscountType.PERCENT);
  // 2) the numeric value entered by user
  const [discountValue, setDiscountValue] = useState<string>('');

  useEffect(() => {
    console.log("MorTs");
    async function MorTs() {
      try {
        const allProducts = await getAllProducts();
        // setAllProducts(allProducts);
        const nonDiscountedProducts = await filterOutDiscounted(allProducts);
        // setNonDiscountedProducts(nonDiscountedProducts);
        const candidates = getHighestPricedNonDiscounted(nonDiscountedProducts);
        setCandidates(candidates);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    MorTs();
  //}, []);
  }, [error, loading]);

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

  if (!candidates.length) {
    return <Text>No eligible products found.</Text>;
  }

  const dropdownOptions = candidates.map(p => ({
    id: p._id ?? '',
    value: p.name ?? '',
  }));

  const selectedProduct = candidates.find(p => p._id === selectedId);
  const maxAmount = selectedProduct?.priceData?.price ?? 0;

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header
          title="Product Discounter"
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
              // prefix={<Icons.Tag />}
              />
              <Card.Divider />
              <Card.Content>
                {candidates
                  .filter(p => p._id === selectedId)
                  .map(p => (
                    <Box key={p._id} gap="12px" direction="horizontal" align="left">
                      <Image
                        src={p.media?.mainMedia?.image?.url}
                        width="15%"
                        height="15%"
                      />
                      <Box gap="4px" direction="vertical">
                        <Heading size="small" as="h3">
                          Product:
                        </Heading>
                        <Text>{p.name}</Text>
                        <Text>Full price: {p.priceData?.formatted?.price}</Text>
                      </Box>
                    </Box>
                  ))}
              </Card.Content>
            </Card>
          </Box>

          {/* new controls: icon selector, input, and apply button */}
          <Box gap="16px" direction="horizontal" align="center" marginTop="16px">
            {/* 1) two icons: pick exactly one */}
            <Box gap="8px" direction="horizontal">
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
            </Box>

            {/* 2) input for the numeric discount value */}
            <FormField label={discountMode === products.DiscountType.PERCENT ? 'Discount %' : 'Discount Amount'}>
              <Input
                type="number"
                min={1}
                max={discountMode === products.DiscountType.PERCENT ? 100 : maxAmount}
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                size="small"
              />
            </FormField>

            {/* 3) apply button – implement logic in onClick */}
            <Button
              priority="primary"
              disabled={!discountValue}
              onClick={async () => {
                await applyDiscountForProduct(selectedId, discountMode, Number(discountValue));
                // setSelectedId(''); // TBD - do it only after getting a success reply for discount

                setLoading(true);
                // Navigate to Products list:
                dashboard.navigate({pageId: "0845ada2-467f-4cab-ba40-2f07c812343d"});
              }}
            >
              Apply Discount
            </Button>
            <Button
              priority="primary"
              disabled={!discountValue}
              onClick={() => {
                dashboard.navigate({pageId: "0845ada2-467f-4cab-ba40-2f07c812343d"});
              }}
            >
              Finish manually
            </Button>
          </Box>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
}




/*

import React, { type FC } from 'react';
import { dashboard } from '@wix/dashboard';
import {
  Button,
  EmptyState,
  Image,
  Page,
  TextButton,
  WixDesignSystemProvider,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
import wixLogo from './wix_logo.svg';

const Index: FC = () => {
  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Page>
        <Page.Header
          title="Dashboard Page"
          subtitle="Add management capabilities to your app."
          actionsBar={
            <Button
              onClick={() => {
                dashboard.showToast({
                  message: 'Your first toast message!',
                });
              }}
              prefixIcon={<Icons.GetStarted />}
            >
              Show a toast
            </Button>
          }
        />
        <Page.Content>
          <EmptyState
            image={
              <Image fit="contain" height="100px" src={wixLogo} transparent />
            }
            title="Start editing this dashboard page"
            subtitle="Learn how to work with dashboard pages and how to add functionality to them using Wix APIs."
            theme="page"
          >
            <TextButton
              as="a"
              href="https://dev.wix.com/docs/build-apps/develop-your-app/frameworks/wix-cli/supported-extensions/dashboard-extensions/dashboard-pages/add-dashboard-page-extensions-with-the-cli#add-dashboard-page-extensions-with-the-cli"
              target="_blank"
              prefixIcon={<Icons.ExternalLink />}
            >
              Dashboard pages documentation
            </TextButton>
          </EmptyState>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
};

export default Index;

*/