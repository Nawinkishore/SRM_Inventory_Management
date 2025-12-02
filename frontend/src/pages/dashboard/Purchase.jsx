import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
const Purchase = () => {
  return (
    <div className='min-h-screen overflow-y-auto '>
      <div>
        {/* <h1 className='font-bold text-xl'>Purchase Stocks</h1>
         */}
         <Link to={'/dashboard/stocks/add'}><Button className={'cursor-pointer'}>Add Stocks</Button></Link>
      </div>
    </div>
  )
}

export default Purchase
