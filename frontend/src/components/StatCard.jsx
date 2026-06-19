function StatCard({
  title,
  value,
  subtext
}) {

  return (

    <div className="stat-card">

      <h4>
        {title}
      </h4>

      <h2>
        {value}
      </h2>

      {subtext && (
        <p className="stat-card-subtext" style={{ fontSize: "13px", fontWeight: "600", margin: "8px 0 0 0" }}>
          {subtext}
        </p>
      )}

    </div>

  );

}

export default StatCard;