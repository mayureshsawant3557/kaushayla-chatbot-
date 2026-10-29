import PropTypes from "prop-types";

const DetailItem = ({ label, value, className = "" }) => {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "-"
      : value;

  return (
    <div className={className}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium text-gray-800 break-words">
        {displayValue}
      </p>
    </div>
  );
};

DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node, // allows JSX, icons, badges later
  ]),
  className: PropTypes.string,
};

export default DetailItem;