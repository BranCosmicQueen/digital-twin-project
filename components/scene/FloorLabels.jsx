'use client';

import { Text } from '@react-three/drei';
import {
  BODEGA_ELEVATION,
  DOCK_INBOUND_1_Z,
  DOCK_INBOUND_2_Z,
  DOCK_OUTBOUND_3_Z,
  DOCK_OUTBOUND_4_Z,
  PATIO_CENTER_X,
  PATIO_CENTER_Z,
  RESPEL_CENTER_X,
  RESPEL_CENTER_Z,
  COLORS,
} from '@/lib/constants';

const labels = [
  {
    text: 'BODEGA',
    position: [30, BODEGA_ELEVATION + 0.05, 25],
    fontSize: 3,
    color: '#666',
  },
  {
    text: 'PATIO DE MANIOBRAS',
    position: [PATIO_CENTER_X, 0.05, PATIO_CENTER_Z],
    fontSize: 2,
    color: '#ffffff',
  },
  {
    text: 'STAGING INBOUND',
    position: [53, BODEGA_ELEVATION + 0.05, (DOCK_INBOUND_1_Z + DOCK_INBOUND_2_Z) / 2],
    fontSize: 1,
    color: COLORS.stagingInbound,
  },
  {
    text: 'STAGING OUTBOUND',
    position: [53, BODEGA_ELEVATION + 0.05, (DOCK_OUTBOUND_3_Z + DOCK_OUTBOUND_4_Z) / 2],
    fontSize: 1,
    color: COLORS.stagingOutbound,
  },
  {
    text: 'ALMACENAMIENTO',
    position: [25, BODEGA_ELEVATION + 0.05, 25],
    fontSize: 1.8,
    color: '#888',
  },
  {
    text: 'ENTRADA',
    position: [96, 0.05, 5],
    fontSize: 1,
    color: COLORS.gateEntry,
  },
  {
    text: 'SALIDA',
    position: [96, 0.05, 39],
    fontSize: 1,
    color: COLORS.gateExit,
  },
  {
    text: 'RADIO DE GIRO 25m',
    position: [PATIO_CENTER_X, 0.05, PATIO_CENTER_Z + 14],
    fontSize: 0.7,
    color: COLORS.turningRadius,
  },
];

export default function FloorLabels() {
  return (
    <group>
      {labels.map((label, i) => (
        <Text
          key={i}
          position={label.position}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={label.fontSize}
          color={label.color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.5}
        >
          {label.text}
        </Text>
      ))}
    </group>
  );
}
