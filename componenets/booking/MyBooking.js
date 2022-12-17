import React, { useEffect } from "react"
import Link from "next/link"
import { MDBDataTable } from "mdbreact"
import easyinvoice from "easyinvoice"

import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"

import { clearErrors } from "../../redux/actions/bookingActions"

const MyBookings = () => {
  const dispatch = useDispatch()

  const { bookings, error } = useSelector((state) => state.bookings)

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearErrors())
    }
  }, [dispatch])

  const setBookings = () => {
    const data = {
      columns: [
        {
          label: "Booking ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Check In",
          field: "CheckIn",
          sort: "asc",
        },
        {
          label: "Check Out",
          field: "CheckOut",
          sort: "asc",
        },
        {
          label: "Amount Paid",
          field: "amount",
          sort: "asc",
        },
        {
          label: "Actions ",
          field: "actions",
          sort: "asc",
        },
      ],
      rows: [],
    }

    bookings &&
      bookings.forEach((booking) => {
        data.rows.push({
          id: booking._id,
          checkIn: new Date(booking.checkInDate).toLocaleString("en-US"),
          checkOut: new Date(booking.checkOutDate).toLocaleString("en-US"),
          amount: "$${booking.amountPaid}",
          actions: (
            <>
              <Link href={"/bookings/${booking._id}"}>
                <a className="btn btn-primary">
                  <i className="fa fa-eye"></i>
                </a>
              </Link>

              <button
                className="btn btn-success mx-2"
                onClick={() => downloadInvoice(booking._id)}
              >
                <i className="fa fa-download"></i>
              </button>
            </>
          ),
        })
      })

    return data
  }

  const downloadInvoice = async (booking) => {
    const data = {
      documentTitle: "Booking INVOICE", //Default o INVOICE
      currnecy: "USD",
      taxNotation: "vat", // Defaults to 'vat'
      "margin-top": 25, // Defaults to '25'
      "margin-right": 25, // Defaults to '25'
      "margin-left": 25, // Defaults to '25'
      "margin-bottom": 25, // Defaults to '25'
      logo: "https://res.cloudinary.com/bookit/image/upload/v1617904918/bookit/bookit_logo_cbgjzv.png",

      customize: {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        // The logo on top of your invoice
        logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",
        // The invoice background
        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      // Your own data
      sender: {
        company: "Book IT",
        address: "13th Street. 47 w 13th St",
        zip: "1001",
        city: "New York",
        country: "United States",
        //"custom1": "custom value 1",
        //"custom2": "custom value 2",
        //"custom3": "custom value 3"
      },
      // Your recipient
      client: {
        company: "{booking.user.name}",
        address: "{booking.user.email",
        zip: "",
        city: "Check In: ${new Date(booking.checkInDate).toLocaleString('en-US')}",
        country:
          "Check In: ${ new Date(booking.checkOutDate).toLocaleString('en-US')}",
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
      },
      information: {
        // Invoice number
        number: "${booking._id}",
        // Invoice data
        date: "${new Date(date.now()).toLocaleString('en-us')}",
        products: [
          {
            quantity: "${booking.daysOfstay}",
            description: "${booking.room.name}",
            tax: 0,
            price: booking.room.pricePerNight,
          },
        ],
        "bottom-notice":
          "this is auto generated Invoice of your booking on Book IT.",
      },
    }

    const result = await easyinvoice.createInvoice(data)
    easyinvoice.download("invoice_${booking._id}.pdf", result.pdf)
  }

  return (
    <div className="conatainer container-fluid">
      <h1 className="my-5">My Bookings</h1>

      <MDBDataTable
        data={setBookings()}
        className="px-3"
        bordered
        striped
        hover
      />
    </div>
  )
}

export default MyBookings
