import React from "react"
import Head from "next/head"

import Header from "./Header"
import Footer from "./Footer"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Layout = ({ children, title = "Book best Hotels for your Holiday" }) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0,width=device-Width" />
      </Head>
      <Header />
      <ToastContainer position="bottom-right" />
      {children}
      <Footer />
    </div>
  )
}

export default Layout
