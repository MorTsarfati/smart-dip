import { useEffect, useState } from "react";
import { products } from '@wix/stores'
import {
  getAllProducts,
  filterOutDiscounted,
  getHighestPricedNonDiscounted,
} from '../../utilities'

import {
  WixDesignSystemProvider,
  Loader,
  Text,
  Box,
  Image,
  Button,
} from "@wix/design-system";
import React from "react";
import { dashboard } from "@wix/dashboard";

export default function SmartDipPlugin() {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<any[] | null>(null);
  const [candidates, setCandidates] = useState<any[] | null>(null);
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

  // Component displaying selected product
  function ProductCard({ product }: { product: products.Product }) {
    const productUrl = product.media?.mainMedia?.image?.url ?? '';
    const productName = product.name;
    const productPrice = product.priceData?.formatted?.price ?? 0;
    return (
      <Box direction="vertical" gap="12px" padding="24px">
        <Text size="medium" weight="bold">
          Most expensive product eligible for discount (currently not discounted)
        </Text>
        <Box gap="12px" align="center">
          <Image width={60} height={60} src={productUrl} fit="cover" />
          <Box direction="vertical">
            <Text>{productName}</Text>
            <Text secondary>{productPrice}</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <WixDesignSystemProvider>
      <Box>
        {loading && <Loader size="small" />}
        {!loading && error
          && (<Text skin="error">Failed to load products: {error.message}</Text>
          )}

        {!loading && !error && !allProducts &&
          (<Text>SmartDip can't discount any product because there are no products in the store.</Text>)}

        {!loading && !error && !candidates &&
          (<Text>SmartDip can't discount any product because all products in the store are already discounted.</Text>)}

        {!loading && !error && candidates && (
          <>
            <ProductCard product={candidates[0]} />
            <Button
              priority="primary"
              onClick={() => {
                dashboard.navigate({ pageId: "c231bfb2-f7b9-4a79-956e-61694768c7d5" });
              }}
            >
              Give people a break
            </Button>
          </>
        )}
      </Box>
    </WixDesignSystemProvider>
  )
}

/*

import React, { type FC } from 'react';
import type { plugins } from '@wix/stores/dashboard';
import {
  WixDesignSystemProvider,
  Card,
  Text,
  TextButton,
  Button,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { dashboard } from '@wix/dashboard';

type Props = plugins.Products.ProductsBannerParams;

const Plugin: FC<Props> = (props) => {
  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Card>
        <Card.Header title="Dashboard Plugin" />
        <Card.Divider />
        <Card.Content size="medium">
          <Text>
            This dashboard plugin was generated with Wix CLI. Customize it according to your logic. To learn more, read our{' '}
            <TextButton as="a" href="https://wix.to/dFFuEki" target="_blank">
              documentation
            </TextButton>
          </Text>
          <Button
            priority="primary"
            onClick={() => {
              dashboard.navigate({ pageId: "c231bfb2-f7b9-4a79-956e-61694768c7d5" });
            }}
          >
            Give people a break
          </Button>

        </Card.Content>
      </Card>
    </WixDesignSystemProvider>
  );
};

export default Plugin;

*/