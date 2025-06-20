"use client";
import React, { useState, useEffect, useRef } from "react";

// Definisikan tipe untuk setiap opsi
interface OptionType {
  label: string;
  value: string;
}

// Definisikan tipe untuk props yang diterima komponen ini dari Header
interface CustomSelectProps {
  options: OptionType[];
  value: string; // Prop untuk menerima nilai terpilih dari parent (Header)
  onChange: (value: string) => void; // Prop untuk mengirim nilai baru ke parent (Header)
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ref untuk mendeteksi klik di luar komponen
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cari objek opsi yang lengkap berdasarkan 'value' yang diterima dari prop
  // Ini menjadi "source of truth" untuk apa yang ditampilkan
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  // Fungsi ini dipanggil saat user mengklik sebuah opsi dari daftar
  const handleOptionClick = (option: OptionType) => {
    onChange(option.value); // Kirim nilai baru ke parent (Header)
    setIsOpen(false); // Langsung tutup dropdown
  };

  // Efek untuk menutup dropdown saat user mengklik di luar area komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    // Tambahkan ref ke elemen paling luar
    <div ref={dropdownRef} className="dropdown-content custom-select relative" style={{ width: "200px" }}>
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {/* Tampilkan label dari 'selectedOption' yang sudah ditentukan dari props */}
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {/* PERBAIKAN BUG: Looping semua opsi, bukan slice(1, -1) */}
        {options.map((option) => (
          <div
            // Gunakan `option.value` yang unik sebagai key
            key={option.value}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              // Bandingkan dengan `selectedOption` yang sudah ditemukan
              selectedOption.value === option.value ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;