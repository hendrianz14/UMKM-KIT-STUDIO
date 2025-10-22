'use client';

import MinusIcon from './icons/MinusIcon';
import PlusIcon from './icons/PlusIcon';

interface QuantityStepperProps {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  max?: number;
}

const QuantityStepper = ({ quantity, setQuantity, max = 10 }: QuantityStepperProps) => {
  const decrement = () => setQuantity((value) => Math.max(1, value - 1));
  const increment = () => setQuantity((value) => Math.min(max, value + 1));

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-800">Jumlah:</h3>
      <div className="flex items-center">
        <button
          onClick={decrement}
          disabled={quantity <= 1}
          className="rounded-lg border p-3 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Kurangi jumlah"
        >
          <MinusIcon />
        </button>
        <span className="w-16 text-center text-lg font-bold text-gray-900" aria-live="polite">
          {quantity}
        </span>
        <button
          onClick={increment}
          disabled={quantity >= max}
          className="rounded-lg border p-3 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Tambah jumlah"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default QuantityStepper;
