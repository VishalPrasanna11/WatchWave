import hero from '../assets/hero.png';

const Hero = () => {
    return (
        <div className="hero" style={{ padding: '20px' }}>
            <img src={hero} alt="hero" className="w-full max-h-[800px] " />
        </div>
    );
};

export default Hero;