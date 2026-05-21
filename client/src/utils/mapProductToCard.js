/** API 상품 문서 → 홈 ProductCard용 필드 정리 */
export const mapProductToCard = (product) => ({
  id: product._id,
  name: product.name,
  price: product.price,
  image: product.image,
  description: product.description,
  sku: product.sku,
  category: product.category,
})
