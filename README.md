# SUBLET Tom - Le Bon Sandwich

LP2

## Services

- lbs_commandes: API Commandes (Node)
- lbs_fabrication: API Fabrication (Node)
- lbs_catalogue: API Catalogue (Directus)
- lbs_authentification: API Authentification (Deno)
- lbs_gateway_front: API Gateway Frontoffice (Node)
- lbs_gateway_back: API Gateway Backoffice (Node)

## Env vars

- ./services/.env

## Commandes utiles

- Install dependencies:
	- Node : `docker-compose run <service> yarn`
	- Go : `docker-compose run <service> go mod download`
- Interactive container: `docker exec -it <service> sh`
- Check API: `curl -i localhost:<port>`
