import React from 'react';
import { SegmentedControl } from '../ui';
import { PERIODS } from '../../utils/periods';

export default function PeriodFilter({ value, onChange }) {
  return <SegmentedControl options={PERIODS} value={value} onChange={onChange} />;
}
