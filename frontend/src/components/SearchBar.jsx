import { useState, useEffect } from "react";
import {
  Paper,
  InputBase,
  Divider,
  IconButton,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import { ExportToCsv } from "export-to-csv";
import axios from "axios";
import { ArrowDownward, ArrowUpward, SaveAlt } from "@mui/icons-material";
import DomainsTable from "./DomainsTable";
const regex =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

function SearchBar() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dataFlag, setdataFlag] = useState(false);
  const [searchQuery, setSearchQuery] = useState([]);
  const [sortData, setSort] = useState("desc");

  const handleChange = (event) => {
    setDomain(event.target.value);
  };

  const handleSubmit = async () => {
    if (regex.test(domain)) {
      setIsLoading(true);
      try {
        const parseData = await axios.post("http://localhost:5500/parseData", {
          domain,
        });
        search(parseData.data);
        setdataFlag(true);
        setIsLoading(false);
      } catch (error) {
        setdataFlag(false);
        console.error(`this is error: ${error}`);
      }
      setDomain("");
    } else {
      alert("you must provide a valid url");
      setDomain("");
    }
  };

  const search = (data) => {
    const searchData = Object.keys(data).map((domainData) => {
      return {
        domain_url: domainData,
        count: data[domainData],
      };
    });
    setSearchQuery(searchData);
  };

  useEffect(() => {
    if (sortData == "desc") {
      const sortDisplayDataDesc = searchQuery.sort(function (a, b) {
        return parseFloat(b.count) - parseFloat(a.count);
      });
      setSearchQuery([...sortDisplayDataDesc]);
    } else if (sortData == "asc") {
      const sortDisplayDataAsc = searchQuery.sort(function (a, b) {
        return parseFloat(a.count) - parseFloat(b.count);
      });
      setSearchQuery([...sortDisplayDataAsc]);
    }
  }, [sortData]);

  const exportToCSV = () => {
    const csvExporter = new ExportToCsv({
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: true,
      title: "Ads.csv",
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    });

    csvExporter.generateCsv(searchQuery);
  };

  return (
    <>
      <Container fixed>
        <Paper
          sx={{
            borderRadius: 2,
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            mb: "2%",
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Enter domain name... (e.g. cnn.com)"
            onChange={handleChange}
          />

          <Button variant="contained" onClick={handleSubmit}>
            Parse Ads.txt
          </Button>

          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

          <Button
            variant="contained"
            onClick={() => {
              exportToCSV();
            }}
          >
            <SaveAlt sx={{ mt: "2px" }} />
          </Button>
        </Paper>
      </Container>
      <Container>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            {dataFlag ? (
              <DomainsTable
                headers={[
                  "Domain",
                  [
                    "Count",
                    <IconButton
                      onClick={() => {
                        setSort("desc");
                      }}
                      key="desc"
                    >
                      <ArrowDownward fontSize="small" color="primary" />
                    </IconButton>,

                    <IconButton
                      aria-label="filter"
                      onClick={() => {
                        setSort("asc");
                      }}
                      key="asc"
                    >
                      <ArrowUpward fontSize="small" color="primary" />
                    </IconButton>,
                  ],
                ]}
                searchQuery={searchQuery}
              />
            ) : null}
          </>
        )}
      </Container>
    </>
  );
}

export default SearchBar;
