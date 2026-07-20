import type { Customer } from "../../features/shared/types";

export function SelectCustomer({ customers, value, onChange }: { customers: Customer[]; value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Müşteri seçin</option>
      {customers.map((customer) => (
        <option value={customer.id} key={customer.id}>{customer.full_name}</option>
      ))}
    </select>
  );
}
