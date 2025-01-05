import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeShareProps {
  url: string;
}

export const QRCodeShare: React.FC<QRCodeShareProps> = ({ url }) => {
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-2">Share via QR Code</h3>
      <QRCodeSVG value={url} size={200} />
    </div>
  )
}

