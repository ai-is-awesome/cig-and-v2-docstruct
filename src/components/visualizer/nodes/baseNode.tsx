import { MessageCircle } from "lucide-react";

export function BaseNode(props) {
  const onChange = (e) => {
    console.log(e.target.value);
  };

  return (
    <div className="bg-gray-100 px-6 py-4 min-h-[150px] min-w-[300px] rounded-md  border-red-500 border">
      <span className="text-sm">Triggers</span>
      <div>
        <div className="flex flex-row gap-2">
          <MessageCircle />
          <span className="text-center  text-xs bg-red-500 px-1 rounded-md text-white">
            Send Email
          </span>
        </div>
      </div>
    </div>
  );
}
