import React from 'react'
import { useParams } from 'react-router-dom'
const PurchaseId = () => {
 const { purchaseId } = useParams();
  return (
    <div>
      {purchaseId}
    </div>
  )
}

export default PurchaseId
