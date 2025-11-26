import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <img
                src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
                alt="404 Background"
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
                style={{
                    backgroundColor: "black",
                    imageRendering: "auto",
                }}
                loading="lazy"
            />

            <div className="absolute inset-0 bg-opacity-70 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-between h-full text-red-900 text-center px-6 py-15">
                <div className="py-10">
                    <h1 className="text-8xl font-extrabold mb-3 drop-shadow-2xl  animate-pulse">
                        404
                    </h1>
                    <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
                </div>
                <div>
                    <p className="text-red-900 mb-8 max-w-md">
                        Oops! The page you’re looking for doesn’t exist or has been moved.
                    </p>

                    <Link
                        to="/"
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold shadow-lg transform transition-transform hover:scale-105"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;
