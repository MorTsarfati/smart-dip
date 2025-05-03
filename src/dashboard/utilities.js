import { products } from '@wix/stores';

/* ---------- Collects all products ---------- */
export async function getAllProducts() {
  const allProducts = [];
  const QUERY_LIMIT = 100;

  let page = await products
    .queryProducts()
    .limit(QUERY_LIMIT)
    .find();

  while (true) {
    allProducts.push(...page.items);
    if (!page.hasNext()) break;
    page = await page.next();
  }

  return allProducts;
}

/* ----- helper for filterOutDiscounted: Checks if product is already discounted ----- */
function isProductDiscounted(p) {
  const pDiscountType = p.discount?.type;
  const pDiscountValue = p.discount?.value;
  
  return (
    (pDiscountType && pDiscountValue)
    && (pDiscountType === products.DiscountType.AMOUNT
      || pDiscountType === products.DiscountType.PERCENT)
    && (pDiscountValue > 0)
  );
}

/* ---- Filters out all discounted products ----- */
export async function filterOutDiscounted(productsArray) {
  return productsArray.filter((p) => !isProductDiscounted(p));
}

/* ----- Finds highest-priced non-discounted product(s) in an array ----- */
export function getHighestPricedNonDiscounted(nonDiscountedProducts) {
  let maxPrice = 0;
  const mostExpensiveProducts = [];

  for (const p of nonDiscountedProducts) {
    const price = p.priceData?.price ?? 0;
    // Clear list if new maximum price is found
    if (price > maxPrice) {
      maxPrice = price;
      mostExpensiveProducts.length = 0;
    }
    // Add product (with price greater than or equal to last maxPrice) to the list
    if (price === maxPrice) {
      mostExpensiveProducts.push(p);
    }
  }

  return mostExpensiveProducts;
}

/* ---- Applies discount for a product, given its _id and discount selections ---- */
export async function applyDiscountForProduct(productId, discountType, discountValue) {
  await products.updateProduct(productId, {
    discount: { type: discountType, value: discountValue },
  });
}