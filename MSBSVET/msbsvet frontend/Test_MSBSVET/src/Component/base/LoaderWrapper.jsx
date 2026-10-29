import Loader from "./Loader";
import { useLoader } from "../../hooks/LoadingProvider";

export default function LoaderWrapper() {
    const { loading } = useLoader();
    return loading ? <Loader /> : null;
}
