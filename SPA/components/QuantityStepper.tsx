import React from 'react';
import { MinusIcon } from './icons/MinusIcon';
import { PlusIcon } from './icons/PlusIcon';

interface QuantityStepperProps {
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    max?: number;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ quantity, setQuantity, max = 10 }) => {
    const decrement = () => setQuantity(q => Math.max(1, q - 1));
    const increment = () => setQuantity(q => Math.min(max, q + 1));

    return (
        <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Jumlah:</h3>
            <div className="flex items-center">
                <button
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="p-3 border rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Kurangi jumlah"
                >
                    <MinusIcon />
                </button>
                <span className="w-16 text-center font-bold text-lg text-gray-900" aria-live="polite">{quantity}</span>
                <button
                    onClick={increment}
                    disabled={quantity >= max}
                    className="p-3 border rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Tambah jumlah"
                >
                    <PlusIcon />
                </button>
            </div>
        </div>
    );
};

export default QuantityStepper;
