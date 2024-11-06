import {Heart} from 'lucide-react';



export function Footer() {
  return (
		<div className="z-20 w-full bg-background/95  items-center shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-4 md:mx-8 flex h-14 items-center text-center">
				<p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
					Built with <Heart className="h-4 w-4 inline" /> by{' '}
					
						Vishal Prasanna
				</p>
			</div>
		</div>
	);
}
