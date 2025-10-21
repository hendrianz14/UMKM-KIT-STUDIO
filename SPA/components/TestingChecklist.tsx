import React, { useState } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
}

interface TestingChecklistProps {
  items: ChecklistItem[];
  title: string;
}

const TestingChecklist: React.FC<TestingChecklistProps> = ({ items, title }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleToggle = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold border-b pb-2 mb-4">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">
        Gunakan checklist ini untuk memastikan semua fungsi di halaman produk publik berjalan dengan baik setelah Anda melakukan perubahan. Uji fungsionalitas di mode <span className="font-semibold">Pratinjau</span> sebelum menyimpan.
      </p>
      <div className="space-y-3">
        {items.map(item => {
          const isChecked = checkedItems.has(item.id);
          return (
            <label key={item.id} className="flex items-start sm:items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-light transition-colors">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(item.id)}
                className="h-5 w-5 rounded border-gray-300 text-secondary focus:ring-secondary mt-1 sm:mt-0 flex-shrink-0"
              />
              <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                {item.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default TestingChecklist;