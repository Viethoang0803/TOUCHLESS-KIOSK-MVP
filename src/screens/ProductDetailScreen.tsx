import type { Product } from '../data/products';
import { TouchlessButton } from '../components/TouchlessButton';
import styles from './ProductDetailScreen.module.css';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onContact: () => void;
  onGoHome: () => void;
}

export function ProductDetailScreen({
  product,
  onBack,
  onContact,
  onGoHome,
}: ProductDetailScreenProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.layout}>
        <div
          className={styles.imageArea}
          style={{ background: `linear-gradient(135deg, ${product.color}44, ${product.color}11)` }}
        >
          <span className={styles.bigIcon}>{product.name.charAt(0)}</span>
        </div>

        <div className={styles.info}>
          <h1>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>

          <h2>Tính năng</h2>
          <ul className={styles.features}>
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <TouchlessButton targetId="product-back" onSelect={onBack} variant="secondary">
              Quay lại danh mục
            </TouchlessButton>
            <TouchlessButton targetId="product-contact" onSelect={onContact}>
              Nhận thông tin
            </TouchlessButton>
            <TouchlessButton targetId="product-home" onSelect={onGoHome} variant="ghost">
              Về trang chủ
            </TouchlessButton>
          </div>
        </div>
      </div>
    </div>
  );
}
