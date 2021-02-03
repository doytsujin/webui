import * as React from "react";
import _ from "lodash";
import styled from "styled-components";
import Flex from "./Flex";

type Props = {
  className?: string;
  pairs: { key: string; value: string }[];
  columns: number;
  resolvers?: {
    [keyName: string]: (
      v: string,
      k: string
    ) => Array<React.ReactElement | string>;
  };
};

const Cell = styled(Flex)`
  flex-direction: column;
  padding: 8px;
  width: 240px;
  box-sizing: border-box;
`;

const Key = styled.div`
  font-weight: bold;
`;

const Value = styled.div``;

const Row = styled(Flex)`
  /* padding: 8px; */
`;

const Styled = (c) => styled(c)``;

function KeyValueTable({ className, pairs, columns, resolvers }: Props) {
  const arr = new Array(Math.ceil(pairs.length / columns))
    .fill(null)
    .map(() => pairs.splice(0, columns));

  return (
    <div role="list" className={className}>
      {_.map(arr, (a, i) => (
        <Row wide key={i}>
          {_.map(a, ({ key, value }) => {
            let k = key;
            let v = value;
            const resolver = resolvers[key];

            if (resolvers[key]) {
              const [mv, mk] = resolver(value, key);

              v = mv as string;
              k = mk as string;
            }

            const label = _.capitalize(k);

            return (
              <Cell role="listitem" key={key}>
                <Key aria-label={label}>{label}</Key>
                <Value>{v}</Value>
              </Cell>
            );
          })}
        </Row>
      ))}
    </div>
  );
}

export default Styled(KeyValueTable);
