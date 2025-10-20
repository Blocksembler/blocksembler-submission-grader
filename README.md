# Blocksembler Submission Grader

## <img src="img/logo.png" alt="drawing" width="200"/>

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)


A node.js service that verifies the correctness of assembly
programms. The application consumes `GradingJobMessages` from
a _RabbitMQ_ queue, which consists of an assembly source code and
the required information to retrieve the related test cases. After
running the test cases the result is stored to the blocksembler database.

## Getting Started

### Run from Source

To get started with the Assembler Programming Learning Environment, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Blocksembler/blocksembler-submission-grader.git
   ```

2. **Install Dependencies**: Navigate to the project directory and install the necessary dependencies.
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm run start
   ```

### Run from Docker Image

Blocksembler is also available on [Docker Hub](https://hub.docker.com/r/blocksembler/blocksembler-frontend/tags). To get
started, follow these steps:

1. **Build docker image**:
    ```bash
    docker build -t blocksembler/submission-grader .
    ```
2. **Run the Container**:
    ```bash
    docker run -d --name submission-grader blocksembler/submission-grader
    ```

### Environment Variables

| Name                             | Default                                                        | Description                                                               |
|----------------------------------|----------------------------------------------------------------|---------------------------------------------------------------------------|
| `BLOCKSEMBLER_ARCHITECTURE`      | `anna`                                                         | Identifier of the architecture plugin to load (e.g., `anna`).             |
| `BLOCKSEMBLER_DB_URI`            | `postgres://postgres:postgres@localhost/blocksembler`          | Connection string for the PostgreSQL database used by Blocksembler.       |
| `BLOCKSEMBLER_MQ_URI`            | `amqp://blocksembler:blocksembler@localhost:5672/blocksembler` | Connection URI for the RabbitMQ message broker used by Blocksembler.      |
| `BLOCKSEMBLER_GRADING_JOB_QUEUE` | `grading-jobs`                                                 | Name of the RabbitMQ queue from which grading jobs are consumed.          |
| `BLOCKSEMBLER_GRADER_MAX_STEPS`  | `100000`                                                       | Maximum number of execution steps allowed per grading job (safety limit). |

## Contributing

Contributions to this project are welcome! If you have ideas for new features, improvements, or bug fixes, feel free to
open an issue or submit a pull request.

## Contact

Florian Wörister | Universität Wien
