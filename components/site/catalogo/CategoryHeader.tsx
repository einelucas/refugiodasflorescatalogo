type CategoryHeaderProps = {
  title: string;
  subtitle: string | null;
};

export function CategoryHeader({ title, subtitle }: CategoryHeaderProps) {
  return (
    <div className="category-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="category-subtitle">{subtitle}</p>}
      </div>
      <div className="category-line" />
    </div>
  );
}
