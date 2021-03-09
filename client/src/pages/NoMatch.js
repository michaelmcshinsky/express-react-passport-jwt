import React from "react";
import { Container, Row, Column } from '../components'

export function NoMatch() {
  return (
    <Container className="my-5">
      <Row>
        <Column className="col-md-12">
          <h1>404 Page Not Found</h1>
        </Column>
      </Row>
    </Container>
  );
}
