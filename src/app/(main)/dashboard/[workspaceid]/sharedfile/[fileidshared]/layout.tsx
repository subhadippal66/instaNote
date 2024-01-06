import React from 'react'


interface FilePageLayoutProps {
    children: React.ReactNode;
    params: any
}


const SharedFileLayout:React.FC<FilePageLayoutProps> = ({children,params}) => {

    // check is shared valid
    

  return (
    <div>{children}</div>
  )
}

export default SharedFileLayout