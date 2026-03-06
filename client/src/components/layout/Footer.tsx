const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Football Web. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
