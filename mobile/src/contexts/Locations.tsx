import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MemberLocation } from "../lib/models";
import { getUserLocations } from "../lib";
import { useNetworkState } from "expo-network";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const DELAY = 5 * MINUTE;

const LocationsContext = createContext<{
  locations: MemberLocation[];
  setFamilyId: (familyId: string) => void;
}>({
  locations: [],
  setFamilyId: () => {
    throw new Error("Uninitialized.");
  },
});

export const useLocations = () => useContext(LocationsContext);

type LocationsProviderProps = {
  initialFamilyId: string | null;
  children: ReactNode;
};

export const LocationsProvider = ({
  initialFamilyId,
  children,
}: LocationsProviderProps) => {
  const network = useNetworkState();
  const [familyId, setFamilyId] = useState(initialFamilyId ?? "");
  const [locations, setLocations] = useState<MemberLocation[]>([]);

  const getLocations = useCallback(() => {
    if (!familyId || !network.isConnected) return;
    getUserLocations(familyId).then(setLocations);
  }, [familyId, network, setLocations]);

  useEffect(() => {
    const itrv = setInterval(getLocations, DELAY);

    return () => clearInterval(itrv);
  }, [getLocations]);

  // The value provided to descendant components
  const value = {
    locations,
    setFamilyId,
  };

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
};
