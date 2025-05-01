import { products } from '@wix/stores';

/* ---------- Collects all products ---------- */
export async function getAllProducts() {
  const allProducts = [];

  let page = await products
    .queryProducts()
    .limit(100)
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
  // There is no discount if type or value are null
  if (!(p.discount?.type && p.discount?.value))
    return false;

  const pType = p.discount.type;
  const pValue = p.discount.value;

  return (
    (pType === products.DiscountType.AMOUNT
      || pType === products.DiscountType.PERCENT)
    && (pValue > 0)
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
export function applyDiscountForProduct(productId, discountType, discountValue) {
  products.updateProduct(productId, {
    discount: { type: discountType, value: discountValue },
  });
}