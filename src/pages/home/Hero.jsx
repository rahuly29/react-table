import React, { useState, useEffect } from 'react';


// data fetching
const fetchDataFromNotion = async () => {
  const notionApiToken = 'secret_iOxGE0kq0QHBBss5AKBjjFQBNy9Bi00iYGcSjzlT0CY';
  const databaseId = 'ac267347e94445da9a32b5e1ccaf98dd';

  try {
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST', // Use POST for Notion API queries
      headers: {
        'Authorization': `Bearer ${notionApiToken}`,
        'Notion-Version': '2022-02-22',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.results; // Assuming the data structure has a 'results' property
  } catch (error) {
    throw new Error(`Failed to fetch data from Notion: ${error.message}`);
  }
};

// extracting first column properties
const extractColumnsFromData = (data) => {
  if (data.length === 0) {
    return [];
  }

  const firstItem = data[0];
  const columns = Object.keys(firstItem.properties).map((field) => ({
    label: field,
    field,
  }));

  return columns;
};


// rendering data dynamically
const DynamicTable = ({ columns, data }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.field}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {columns.map((column) => (
              <td key={column.field}>
                {/* {item.properties[column.field]?.title?.[0]?.text?.content || 'N/A'} */}
                {/* {item.properties[column.field]?.[0]?.plain_text || 'N/A'} */}
                {renderCellValue(item.properties[column.field])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};


// Helper function to render cell value based on property type
const renderCellValue = (property) => {
  if (!property) {
    return 'N/A';
  }

  switch (property.type) {
    case 'title':
      return property.title[0]?.text?.content || 'N/A';
    case 'rich_text':
      return property.rich_text[0]?.text?.content || 'N/A';
    case 'number':
      return property.number || 'N/A';
    case 'date':
      return property.date?.start || 'N/A';
    case 'url':
      return property.url || 'N/A';
    // Add more cases for other property types if needed
    default:
      return 'N/A';
  }
};

// main component

const Hero = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notionData = await fetchDataFromNotion();
        console.log("Notion data:", notionData);
        setData(notionData);

        // Extract column information dynamically from the first data item
        const extractedColumns = extractColumnsFromData(notionData);
        setColumns(extractedColumns);
      } catch (error) {
        console.error('Error fetching data from Notion:', error.message);
      }
    };

    fetchData();
  }, []); // Run once on component mount

  return (
    <>
      <h1>Table</h1>
      {/* Render the dynamic table */}
      <DynamicTable columns={columns} data={data} />
    </>
  );
};

export default Hero;
