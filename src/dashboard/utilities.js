import { products } from '@wix/stores';

/* ---------- function 1: collects all products ---------- */
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

/* ----- helper for function 2: checks if product is already discounted ----- */
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

/* ---------- function 2: filters out all discounted products ---------- */
export async function filterOutDiscounted(productsArray) {
  return productsArray.filter((p) => !isProductDiscounted(p));
}

/* ----- function 3: finds highest-priced non-discounted product(s) in an array ----- */
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

export function applyDiscountForProduct(productId, discountType, discountValue) {
  products.updateProduct(productId, {
    discount: { type: discountType, value: discountValue },
  });
}