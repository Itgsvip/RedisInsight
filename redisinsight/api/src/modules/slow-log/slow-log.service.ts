import IORedis from 'ioredis';
import { concat } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { IFindRedisClientInstanceByOptions, RedisService } from 'src/modules/core/services/redis/redis.service';
import { InstancesBusinessService } from 'src/modules/shared/services/instances-business/instances-business.service';
import { SlowLog, SlowLogConfig } from 'src/modules/slow-log/models';
import { SlowLogArguments, SlowLogCommands } from 'src/modules/slow-log/constants/commands';
import { convertStringsArrayToObject } from 'src/utils';
import { UpdateSlowLogConfigDto } from 'src/modules/slow-log/dto/update-slow-log-config.dto';

@Injectable()
export class SlowLogService {
  private logger = new Logger('SlowLogService');

  constructor(
    private redisService: RedisService,
    private instancesBusinessService: InstancesBusinessService,
  ) {}

  /**
   * Get slow logs for each node and return concatenated result
   * @param clientOptions
   */
  async getSlowLogs(
    clientOptions: IFindRedisClientInstanceByOptions,
  ) {
    this.logger.log('Getting slow logs');

    const client = await this.getClient(clientOptions);
    const nodes = await this.getNodes(client);

    return concat(...(await Promise.all(nodes.map((node) => this.getNodeSlowLogs(node)))));
  }

  /**
   * Get array of slow logs for particular node
   * @param node
   */
  async getNodeSlowLogs(node: IORedis.Redis): Promise<SlowLog[]> {
    const resp = await node.send_command(SlowLogCommands.SlowLog, SlowLogArguments.Get);
    return resp.map((log) => {
      const [id, time, durationUs, args, source, client] = log;

      return {
        id,
        time,
        durationUs,
        args: args.join(' '),
        source,
        client,
      };
    });
  }

  /**
   * Clear slow logs in all nodes
   * @param clientOptions
   */
  async reset(
    clientOptions: IFindRedisClientInstanceByOptions,
  ): Promise<void> {
    this.logger.log('Resetting slow logs');

    const client = await this.getClient(clientOptions);
    const nodes = await this.getNodes(client);
    await Promise.all(nodes.map((node) => node.send_command(SlowLogCommands.SlowLog, SlowLogArguments.Reset)));
  }

  /**
   * Get current slowlog config to show for user
   * @param clientOptions
   */
  async getConfig(
    clientOptions: IFindRedisClientInstanceByOptions,
  ): Promise<SlowLogConfig> {
    const client = await this.getClient(clientOptions);
    const resp = convertStringsArrayToObject(
      await client.send_command(SlowLogCommands.Config, [SlowLogArguments.Get, 'slowlog*']),
    );

    return {
      slowlogMaxLen: parseInt(resp['slowlog-max-len'], 10) || 0,
      slowlogLogSlowerThan: parseInt(resp['slowlog-log-slower-than'], 10) || 0,
    };
  }

  /**
   * Update slowlog config
   * @param clientOptions
   * @param dto
   */
  async updateConfig(
    clientOptions: IFindRedisClientInstanceByOptions,
    dto: UpdateSlowLogConfigDto,
  ): Promise<SlowLogConfig> {
    const commands = [];

    if (dto.slowlogLogSlowerThan !== undefined) {
      commands.push({
        command: SlowLogCommands.Config,
        args: [SlowLogArguments.Set, 'slowlog-log-slower-than', dto.slowlogLogSlowerThan],
      });
    }

    if (dto.slowlogMaxLen !== undefined) {
      commands.push({
        command: SlowLogCommands.Config,
        args: [SlowLogArguments.Set, 'slowlog-max-len', dto.slowlogMaxLen],
      });
    }

    if (commands.length) {
      const client = await this.getClient(clientOptions);
      const nodes = await this.getNodes(client);
      const promises = concat(...(commands.map(
        (command) => nodes.map((node) => node.send_command(command.command, command.args)),
      )));
      await Promise.all(promises);
    }

    return this.getConfig(clientOptions);
  }

  /**
   * Get redis nodes to execute commands like "slowlog get", "slowlog clean", etc. for each node
   * @param client
   * @private
   */
  private async getNodes(client: IORedis.Redis | IORedis.Cluster): Promise<IORedis.Redis[]> {
    if (client instanceof IORedis.Cluster) {
      return client.nodes();
    }

    return [client];
  }

  /**
   * Get or create redis "common" client
   *
   * @param clientOptions
   * @private
   */
  private async getClient(clientOptions: IFindRedisClientInstanceByOptions) {
    const { tool, instanceId } = clientOptions;

    const commonClient = this.redisService.getClientInstance({ instanceId, tool })?.client;

    if (commonClient && this.redisService.isClientConnected(commonClient)) {
      return commonClient;
    }

    return this.instancesBusinessService.connectToInstance(
      clientOptions.instanceId,
      clientOptions.tool,
      true,
    );
  }
}
