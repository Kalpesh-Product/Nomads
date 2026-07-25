import { Navigate, useParams } from "react-router-dom";

const LegacyVenueRedirect = () => {
  const { venueId } = useParams();

  return <Navigate to={`/places/${venueId}`} replace />;
};

export default LegacyVenueRedirect;
