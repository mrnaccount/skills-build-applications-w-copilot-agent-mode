import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  emptyText: string;
  items: T[] | null;
  error: string | null;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CapabilityCard<T>({ title, description, emptyText, items, error, renderItem }: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p className="alert alert-danger" role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p role="status">{emptyText}</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((item, index) => (
              <li className="list-group-item" key={index}>{renderItem(item, index)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
