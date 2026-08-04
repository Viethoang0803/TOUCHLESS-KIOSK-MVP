import { PRODUCTS } from '../data/products';
import { TouchlessButton } from '../components/TouchlessButton';
import styles from './CatalogScreen.module.css';

interface CatalogScreenProps {
  onSelectProduct: (productId: string) => void;
  onGoHome: () => void;
}

export function CatalogScreen({ onSelectProduct, onGoHome }: CatalogScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1>Danh mục sản phẩm</h1>
        <p className={styles.scrollHint}>
          Đưa cursor xuống mép dưới màn hình để cuộn xem thêm sản phẩm
        </p>
        <TouchlessButton
          targetId="catalog-home"
          onSelect={onGoHome}
          variant="ghost"
          size="md"
        >
          Về trang chủ
        </TouchlessButton>
      </header>

      <div className={styles.grid}>
        {PRODUCTS.map((product) => (
          <article key={product.id} className={styles.card}>
            <div
              className={styles.imagePlaceholder}
              style={{ background: `linear-gradient(135deg, ${product.color}33, ${product.color}11)` }}
            >
              <span className={styles.icon}>{product.name.charAt(0)}</span>
            </div>
            <h2>{product.name}</h2>
            <p>{product.shortDescription}</p>
            <TouchlessButton
              targetId={`open-${product.id}`}
              onSelect={() => onSelectProduct(product.id)}
            >
              Xem chi tiết
            </TouchlessButton>
          </article>
        ))}
      </div>
    </div>
  );
}
