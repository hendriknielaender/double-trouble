import React from 'react'

type Props = {
  data: any
}

const GetData = ({ data }: Props) => {
  return (
    <main className='w-full'>
      <div className="px-4">
        {
          data?.results?.map((item, index) => {
            return (
              <section key={index}>
                <a href={`${item.category}/${item.id}`}>
                  <div className='my-4 p-2'>
                    <img className="rounded"
                      src={`https://image.tmdb.org/t/p/w500/${item.backdrop_path ||
                        item.profile_path ||
                        item.postal_path}`} alt="images" />

                    <p className="border mt-2 border-slate-50 rounded-md hover:bg-    slate-500 w-fit p-1 text-xs">
                      Date: {item.release_date}
                    </p>
                    <p className='font-semibold text-lg my-2'>
                      {item.title || item.original_name || item.name}
                    </p>
                  </div>
                </a>

              </section>
            )
          })
        }
      </div>
    </main>

  )
}

export default GetData
