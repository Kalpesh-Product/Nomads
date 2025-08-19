import React from 'react'

const ProductCard = ({product}) => {
  return (
    <div className='h-full flex flex-col gap-2'>
        <div className='text-center'>
            <h1>{product.productName || "Co-Working"}</h1>
        </div>
        <div className='relative h-[16rem] overflow-hidden rounded-xl '>
            <img src="https://picsum.photos/id/1016/1600/900" alt="img" className='h-full rounded-xl overflow-hidden' />
            <div className='absolute inset-0 bg-black/50 flex flex-col justify-end items-center p-8 overflow-hidden'>
                <button className="border-white border-2 px-8 py-2 rounded-full pointer-events-auto text-white">
                    Click here
                </button>
            </div>
        </div>
      
    </div>
  )
}

export default ProductCard
