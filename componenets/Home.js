import React, { useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Pagination from "react-js-pagination"

import RoomItem from "./room/RoomItem"

import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"

import { clearErrors } from "../redux/actions/roomActions"
import { Router } from "next/router"

const Home = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { rooms, resPerPage, roomsCount, filteredRoomsCount, error } =
    useSelector((state) => state.allRooms)

  let { location, page = 1 } = router.query
  page = Number(page)

  useEffect(() => {
    toast.error(error)
    dispatch(clearErrors())
  }, [])

  let queryParams
  if (typeof window !== "undefined") {
    queryParams = new URLSearchParams(window.location.search)
  }

  const handlePagination = (pageNumber) => {
    if (queryParams.has("page")) {
      queryParams.set("page", pageNumber)
    } else {
      queryParams.has("page", pageNumber)
    }

    router.replace({
      search: queryParams.toString(),
    })
  }

  let count = roomsCount
  if (location) {
    count = filteredRoomsCount
  }

  return (
    <>
      <section id="rooms" className="container mt-5">
        <h2 className="mb-3 ml-2 stays-heading">
          {location ? 'Rooms in {" + location +"}' : "AllRooms"}
        </h2>

        <Link href="/Search">
          {" "}
          <i className="fa fa-arrow-left"></i> Back to Search
          <a className="ml-2 back-to-search"></a>
        </Link>
        <div className="row">
          {rooms && rooms.length === 0 ? (
            <div className="alert alert-danger mt-5 w-100">
              <b>No Rooms.</b>
            </div>
          ) : (
            rooms &&
            rooms.map((room) => <RoomItem key={room._id} room={room} />)
          )}
        </div>
      </section>

      {resPerPage < count && (
        <div className="div.d-flex.justify-content-center mt-5">
          <Pagination
            activePage={page}
            itemscountPerPage={resPerPage}
            totalItemsCount={roomsCount}
            onChange={handlePagination}
            nextPageText={"Next"}
            prevPageText={"prev"}
            firstPageText={"First"}
            lastPageText={"Last"}
            itemClass="page-item"
            linkClass="page-link"
          />
        </div>
      )}
    </>
  )
}

export default Home
