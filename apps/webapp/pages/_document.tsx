/* eslint-disable @next/next/no-sync-scripts */
import { DocumentHeadTags, documentGetInitialProps } from '@mui/material-nextjs/v15-pagesRouter';
import { primaryBrandColor } from '@packages/config/colors';
import { Head, Html, Main, NextScript } from 'next/document';

const brandColor = primaryBrandColor;

export default function MyDocument(props: any) {
  return (
    <Html lang='en'>
      <Head>
        <DocumentHeadTags {...props} />
        <meta name='theme-color' content={brandColor} />
        <link rel='icon' href='/favicon.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='192x192' href='/android-chrome-192x192.png' />
        <link rel='icon' type='image/png' sizes='512x512' href='/android-chrome-512x512.png' />
        <script src='/__ENV.js' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// ref: https://mui.com/material-ui/integrations/nextjs/#pages-router
MyDocument.getInitialProps = async (ctx: any) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
