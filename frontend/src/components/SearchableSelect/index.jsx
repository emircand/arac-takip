import { useAutocomplete } from '@mui/base/useAutocomplete'

/**
 * Props:
 *   name        – form field name
 *   value       – selected option id (string)
 *   onChange    – fn({ target: { name, value } })
 *   options     – [{ id, label }]
 *   placeholder – string
 *   required    – bool
 */
export default function SearchableSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = '— Seçin —',
  required = false,
}) {
  const selected = options.find((o) => o.id === value) ?? null

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    popupOpen,
    focused,
  } = useAutocomplete({
    options,
    value: selected,
    onChange: (_e, newVal) => {
      onChange({ target: { name, value: newVal?.id ?? '' } })
    },
    getOptionLabel: (o) => o.label,
    isOptionEqualToValue: (o, v) => o.id === v.id,
    autoHighlight: true,
    selectOnFocus: true,
    clearOnBlur: false,
    openOnFocus: true,
  })

  const inputProps = getInputProps()

  return (
    <div {...getRootProps()} className="relative">
      <input
        {...inputProps}
        placeholder={selected ? selected.label : placeholder}
        required={required}
        className={`w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          focused ? 'border-blue-500' : 'border-gray-200'
        }`}
      />

      {popupOpen && groupedOptions.length > 0 && (
        <ul
          {...getListboxProps()}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto py-1"
        >
          {groupedOptions.map((option, index) => {
            const { key, ...optionProps } = getOptionProps({ option, index })
            const isSelected = option.id === value
            return (
              <li
                key={key}
                {...optionProps}
                className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between
                  ${optionProps['aria-selected'] ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  ${isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'}
                `}
              >
                {option.label}
                {isSelected && (
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
