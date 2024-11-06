import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

const LoadingButton = () => {
    return (
        <Button disabled>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Uploading......
        </Button>
    );
}

export default LoadingButton;