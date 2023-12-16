import { useEffect, useState } from "react";

function AllListings() {
  const [auctionListings, setAuctionListings] = useState([]);
  const [filteredAuctionListings, setFilteredAuctionListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshData, setRefreshData] = useState(false);
  const [bidAmounts, setBidAmounts] = useState({});

  useEffect(() => {
    const fetchDataAndResetRefresh = async () => {
      try {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem("access_token");

        const response = await fetch(
          "https://api.noroff.dev/api/v1/auction/listings?sort=created&sortOrder=desc",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const sortedListings = data.sort(
            (a, b) => new Date(b.created) - new Date(a.created)
          );
          setAuctionListings(sortedListings);
          setFilteredAuctionListings(sortedListings);
        } else {
          console.error("Error fetching data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setRefreshData(false);
    };

    fetchDataAndResetRefresh();
  }, [refreshData]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredListings = auctionListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
    );

    setFilteredAuctionListings(filteredListings);
  };

  const handleBidSubmit = async (listingId) => {
    try {
      const response = await fetch(
        `https://api.noroff.dev/api/v1/auction/listings/${listingId}/bids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            amount: Number(bidAmounts[listingId]) || 0,
          }),
        }
      );

      if (response.ok) {
        console.log("Bid placed successfully!");

        // Retrieve current user credits from local storage
        const currentUserCredits = JSON.parse(
          localStorage.getItem("user_credits") || "0"
        );

        // Update user credits and set it back to local storage
        const updatedUserCredits =
          currentUserCredits - (Number(bidAmounts[listingId]) || 0);
        localStorage.setItem(
          "user_credits",
          JSON.stringify(updatedUserCredits)
        );

        setRefreshData(true);
      } else {
        const errorData = await response.json();
        console.error("Error submitting bid:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <input
        type="text"
        placeholder="Search through listings..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="bg-white text-black p-2 mb-4 border rounded-md"
      />

      <div className="grid grid-cols-2 gap-4">
        {filteredAuctionListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white-100 p-4 rounded-md border-4"
          >
            <h1 className="text-2xl font-bold mb-2 text-black">
              {listing.title}
            </h1>
            <p className="text-gray-700 mb-4">{listing.description}</p>
            <p className="text-gray-600">
              Ends at: {new Date(listing.endsAt).toLocaleString()}
            </p>
            <p className="text-gray-600">Bids: {listing._count.bids}</p>
            <img className="mt-4" src={listing.media[0]} alt={listing.title} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBidSubmit(listing.id);
              }}
            >
              <label>
                Bid Amount:
                <input
                  type="number"
                  value={bidAmounts[listing.id] || 0}
                  onChange={(e) =>
                    setBidAmounts((prevBidAmounts) => ({
                      ...prevBidAmounts,
                      [listing.id]: e.target.value,
                    }))
                  }
                  required
                  className="bg-white text-black ml-2 border rounded-md p-1"
                />
              </label>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2"
              >
                Place Bid
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllListings;
