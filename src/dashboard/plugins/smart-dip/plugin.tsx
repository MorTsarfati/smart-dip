import React, { useEffect, useState } from "react";
import { products } from '@wix/stores';
import {
  getAllProducts,
  filterOutDiscounted,
  getHighestPricedNonDiscounted,
} from '../../utilities';

import {
  WixDesignSystemProvider,
  Loader,
  Text,
  Box,
  Image,
  Button,
  Card,
} from "@wix/design-system";
import '@wix/design-system/styles.global.css';
import { dashboard } from "@wix/dashboard";

export default function SmartDipPlugin() {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<products.Product[]>([]);
  const [candidates, setCandidates] = useState<products.Product[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Function for setting arrays of products (and states)
  async function initialSet() {
    try {
      const allProducts = await getAllProducts();
      setAllProducts(allProducts);
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

  const selectedProduct = candidates?.[0];

  return (
    <WixDesignSystemProvider>
      <Card>
        <Card.Header title="SmartDip" />
        <Card.Divider />
        <Card.Content>
          {loading ? (
            <Box align="center" verticalAlign="middle">
              <Loader text="Loading..." />
            </Box>
          ) : error ? (
            <Text type="error">{error.message}</Text>
          ) : !allProducts || allProducts.length === 0 ? (
            <Text>SmartDip couldn't discount any product because there are no products on the store.</Text>
          ) : !candidates || candidates.length === 0 ? (
            <Text>SmartDip couldn't discount any product because all products are already discounted.</Text>
          ) : (
            <Box gap="12px" direction="horizontal" align="left">
              <Image
                src={selectedProduct?.media?.mainMedia?.image?.url}
                width="auto"
                height="100px"
              />
              <Box gap="8px" direction="vertical" align="left">
                <Box gap="4px" direction="horizontal" align="left">
                  <Text weight="bold">Product:</Text>
                  <Text>{selectedProduct?.name}</Text>
                </Box>
                <Box gap="4px" direction="horizontal" align="left">
                  <Text weight="bold">Full price:</Text>
                  <Text>{selectedProduct?.priceData?.formatted?.price}</Text>
                </Box>
                <Button
                  priority="primary"
                  disabled={candidates.length === 0}
                  onClick={() => {
                    dashboard.navigate({ pageId: "c231bfb2-f7b9-4a79-956e-61694768c7d5" }, { displayMode: "main" });
                  }}
                >
                  Let's offer a discount!
                </Button>
              </Box>
            </Box>
          )}
        </Card.Content>
      </Card>
    </WixDesignSystemProvider>
  );
}