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