import { IoPerson } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

export default function UserAvatar({isUserMove}) {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-3 p-2 pr-4 rounded-full bg-chess-board/10 border border-white/5 backdrop-blur-sm w-fit">
      <div className="relative">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-board-light border-2 border-chess-gold shadow-md">
          <IoPerson className="text-chess-board text-5xl" />
        </div>
        
        {isUserMove&&<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
      </div>

      <h2 className="text-sm font-black text-chess-gold uppercase tracking-wide">
        {user ? user.username : "You"}
      </h2>
    </div>
  );
}