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
        <p style={{ fontSize: "11px", margin: "5px 0 0 0", opacity: 0.8 }}>
          {subtext}
        </p>
      )}

    </div>

  );

}

export default StatCard;