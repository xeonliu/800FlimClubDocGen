import { generateTimeOptions } from "../utils/date_format";

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

const TIME_OPTIONS = generateTimeOptions();

/**
 * 以15分钟为单位的时间下拉选择器
 */
export default function TimeSelect({ value, onChange, id }: TimeSelectProps) {
  return (
    <select
      id={id}
      className="editor-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
