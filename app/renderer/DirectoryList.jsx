var React = require('react');

function DirectoryList (props) {
  return (
    <table className="table-striped">
      <thead>
        <tr>
          <th>Directory</th>
          <th>
            <span
              className="icon icon-cancel-circled"
              style={{ cursor: 'pointer' }}
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {props.directories.map(function (dir, index) {
          <tr>
            <td title={dir}>{dir}</td>
            <td>
              <span
                className="icon icon-cancel-circled"
                onClick={function () {
                  props.onRemoveDirectory(index);
                }}
                style={{ cursor: 'pointer' }}
              />
            </td>
          </tr>
        })}
      </tbody>
    </table>
  );
}

module.exports = DirectoryList;
