import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Real-Time Performance",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Experience sub-second portfolio updates and live leaderboards powered by
        Linera's revolutionary microchain architecture. No more waiting for
        block confirmations.
      </>
    ),
  },
  {
    title: "Unlimited Scalability",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Run unlimited parallel leagues without performance degradation. Each
        player gets their own <code>personal portfolio chain</code> for true
        data sovereignty.
      </>
    ),
  },
  {
    title: "Professional AI Integration",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Native oracle integration provides advanced market analysis and
        AI-powered insights. Get professional-grade trading intelligence in
        real-time.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} role='img' />
      </div>
      <div className='text--center padding-horiz--md'>
        <Heading as='h3'>{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
